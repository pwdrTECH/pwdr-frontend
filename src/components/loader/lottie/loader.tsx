import Lottie from "lottie-react";
import loader from "./loader.json";

const Loader = ({
  message = "Loading... Please wait",
}: {
  message: string;
}) => (
  <div className="w-full flex flex-col justify-center items-center py-10">
    <Lottie
      style={{ width: 250, height: 60 }}
      animationData={loader}
      loop={true}
    />
    <p className="text-center font-hnd font-semibold text-gray-600">
      {message}
    </p>
  </div>
);

export default Loader;
