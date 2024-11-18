export function getEnv() {
  return (
    window["env"] || {
      API_ROOT: "",
      UPDATE_FREQUENCY: 300000,
      DONATION_LINK: "",
    }
  );
}
