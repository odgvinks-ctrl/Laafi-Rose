import "./LecteurAudio.css";

export default function LecteurAudio({ source }) {
  return (
    <div className="lecteur-audio">
      <audio src={source} controls preload="none" />
    </div>
  );
}
