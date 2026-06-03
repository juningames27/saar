const isLocal =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1";

window.SAAR_API = isLocal
  ? "http://localhost:3000"
  : "https://saar-ryqd.onrender.com";