export function LoadingScreen({ message }: { message: string }) {
  return (
    <div className="loading-screen">
      <div className="loading-orb" />
      <p>{message}</p>
    </div>
  );
}
