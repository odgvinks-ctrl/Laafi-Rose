import "./Logo.css";

export default function Logo({ taille = 30 }) {
  return (
    <span className="logo">
      <svg width={taille} height={taille} viewBox="0 0 40 40" aria-hidden="true">
        <rect width="40" height="40" rx="11" fill="#B23A62" />
        <path d="M20 33 C12.5 29 10.5 20.5 14.5 12.5 C16.8 16.5 18.6 18.2 20 19 C21.4 18.2 23.2 16.5 25.5 12.5 C29.5 20.5 27.5 29 20 33 Z" fill="#FBF8F6" />
        <circle cx="20" cy="8.6" r="2.6" fill="#FBF8F6" />
      </svg>
      <span className="logo-nom">
        Laafi <em>Rose</em>
      </span>
    </span>
  );
}
