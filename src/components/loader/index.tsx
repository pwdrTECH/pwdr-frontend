import Image from "next/image";

const PageLoader = () => {
  return (
    <div className="fixed inset-0 bg-white bg-opacity-95 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-5">
        <Image
          width={200}
          height={200}
          src="/logo-head.gif"
          alt="Loading..."
          className="w-32 h-32 object-contain"
        />
        <p className="text-lg font-hnd font-medium text-gray-700">Loading...</p>
      </div>
    </div>
  );
};

export default PageLoader;
