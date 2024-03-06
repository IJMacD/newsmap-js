import { useContext, useEffect, useRef, useState } from 'react';
import { getNews } from '../sources/GoogleNewsRSS.js';
import { ucfirst } from '../util.js';
import { SearchContext } from '../SearchContext.js';
import { isSearchMatching } from '../isSearchMatching.js';

/**
 * @typedef {import('./Edition.jsx').Category} Category
 * @typedef {import('./Edition.jsx').Article} Article
 */

/**
 * @param {string[]} categories
 * @param {number} refreshTime
 * @param {string} edition
 * @param {number} itemsPerCategory
 * @param {"time"|"sourceCount"|"sources"|"position"} weightMode
 */
export function useCategoryItems(categories, refreshTime, edition, itemsPerCategory, weightMode = "time") {

    const [categoryData, setCategoryData] = useState(/** @type {{ [id: string]: Category }} */({}));
    const loaderRef = useRef(/** @type {((cancellable: { current: boolean; }) => void)?} */(null));

    // Rebind function with current props
    loaderRef.current = (cancellable) => loadStaleCategories(cancellable);

    /**
     * @param {{ current: boolean; }} [cancellable]
     */
    async function loadStaleCategories(cancellable) {
        const now = Date.now();

        const todoList = categories.filter(id => {
            const cat = categoryData[id];
            if (!cat) return true;
            return (cat.loadedAt + refreshTime) < now;
        });

        if (todoList.length === 0) {
            return;
        }

        // @ts-ignore
        if (import.meta.env.DEV) {
            console.log(`Loading: ${todoList.join()}`);
        }

        try {
            const loadedCategories = await Promise.all(
                todoList.map(category => getNews({ category, edition }).then(data => {
                    let { category, articles, title } = data;
                    const key = `${edition}_${category}`;

                    return {
                        id: category,
                        key,
                        name: title,
                        articles,
                        loadedAt: now,
                    };
                }))
            );

            if (!cancellable || cancellable.current) {
                setCategoryData(categoryData => {
                    const newCategoryData = { ...categoryData };
                    for (const cat of loadedCategories) {
                        newCategoryData[cat.id] = cat;
                    }
                    return newCategoryData;
                });
            }
        }
        catch (e) {
            console.log(e);
        }
    }

    useEffect(() => {
        if (loaderRef.current) {
            let cancellable = { current: true };

            loaderRef.current(cancellable);

            return () => { cancellable.current = false; };
        }
    }, [edition, categories]);

    useEffect(() => {
        let cancellable = { current: true };

        // Every 10 seconds check for stale categories with current function
        const id = setInterval(() => {
            if (loaderRef.current) {
                loaderRef.current(cancellable);
            }
        }, 10 * 1000);

        return () => { clearInterval(id); cancellable.current = false; };
    }, []);

    /** @type {Category[]} */
    const loadedCategories = categories.map(categoryID =>
        categoryData[categoryID] ||
        // Dummy category while it loads
        {
            id: categoryID,
            key: `${edition}_${categoryID}`,
            name: ucfirst(categoryID),
            articles: [],
            loadedAt: 0,

        }
    );

    const now = Date.now();

    /**
     * @type {{ [type: string]: (article: Article, index: number) => number }}
     */
    const weightingFns = {
        "time": a => 1 / (now - +new Date(a.publishedAt)),
        "sourceCount": a => a.sources.length,
        "sources": (a, i) => a.sources.length / (i + 1),
        "position": (_, i) => 1 / (i + 1),
    };

    const weight = weightingFns[weightMode] || weightingFns["time"];

    const searchValue = useContext(SearchContext);

    let items = loadedCategories.map(c => {
        let articles = c.articles.map((a, i) => ({ ...a, weight: weight(a, i), category: c.id }));

        if (searchValue.mode === "filter") {
            articles = articles.filter(item => isSearchMatching(searchValue, item));
        }

        articles.sort((a, b) => b.weight - a.weight);

        if (articles.length > itemsPerCategory) {
            articles.length = itemsPerCategory;
        }

        return {
            ...c,
            articles,
            weight: articles.reduce((t, a) => t + a.weight, 0),
        };
    });

    // Reserve dummy space for loading categories
    const loadedItems = items.filter(it => it.loadedAt);
    if (loadedItems.length > 0 && loadedItems.length < items.length) {
        const averageWeight = loadedItems.reduce((sum, it) => sum + it.weight, 0) / loadedItems.length;
        for (const item of items) {
            if (item.loadedAt == 0 && item.weight === 0) item.weight = averageWeight;
        }
    }

    items.sort((a, b) => b.weight - a.weight);

    return items;
}
