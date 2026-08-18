export const PlaceholderPage = ({ title }) => {
  return (
    <>
      <div>
        <h2>{title}</h2>
        <div className="placeholder-card">
          <p>
            Halaman <strong>{title}</strong> soon.
          </p>
        </div>
      </div>

      <style>{`
        .placeholder-card {
          background: white;
          padding: 24px;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
          margin-top: 16px;
        }
      `}</style>
    </>
  );
};