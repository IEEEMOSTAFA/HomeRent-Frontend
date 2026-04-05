// Add an unauthorized page for better user experience
import { NextPage } from "next";

const Unauthorized: NextPage = () => {
  return (
    <div className="flex items-center justify-center h-screen">
      <h1 className="text-2xl font-bold">Unauthorized Access</h1>
      <p className="mt-4">You do not have permission to view this page.</p>
    </div>
  );
};

export default Unauthorized;