type LoadingScreenProps = {
  message?: string;
};

export function LoadingScreen({
  message = 'Preparing the procedural stadium…',
}: LoadingScreenProps) {
  return (
    <div className="loading-screen" role="status">
      <span className="loading-screen__mark" aria-hidden="true">
        RV
      </span>
      <p>{message}</p>
    </div>
  );
}
