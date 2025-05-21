

const LoadingAnimation = () => {
  return (
    <div className="flex items-center justify-center">
      <div className="relative h-24 w-24">
        <div className="absolute top-0 left-0 right-0 bottom-0 flex items-center justify-center">
          <div className="h-16 w-16 rounded-full border-4 border-t-purple-600 border-b-purple-600 border-l-transparent border-r-transparent animate-spin"></div>
        </div>
        <div className="absolute top-0 left-0 right-0 bottom-0 flex items-center justify-center">
          <div className="h-12 w-12 rounded-full border-4 border-l-purple-400 border-r-purple-400 border-t-transparent border-b-transparent animate-spin animation-delay-150"></div>
        </div>
        <div className="absolute top-0 left-0 right-0 bottom-0 flex items-center justify-center">
          <div className="h-8 w-8 rounded-full border-4 border-t-purple-300 border-b-purple-300 border-l-transparent border-r-transparent animate-spin animation-delay-300"></div>
        </div>
        <style jsx="true">{`
          @keyframes spin {
            0% {
              transform: rotate(0deg);
            }
            100% {
              transform: rotate(360deg);
            }
          }
          .animation-delay-150 {
            animation-delay: 0.15s;
          }
          .animation-delay-300 {
            animation-delay: 0.3s;
          }
          .animate-spin {
            animation: spin 1.5s linear infinite;
          }
        `}</style>
      </div>
    </div>
  );
};

export default LoadingAnimation;
