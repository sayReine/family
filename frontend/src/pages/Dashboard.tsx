import React from "react";
import FamilyTree from "./FamilyTree";
import Members from "./Members";
import Generations from "./Generations";

const Dashboard: React.FC = () => {
  return (
    <div className="min-h-screen">
      <div className="container mx-auto py-10">
        {/* <h1 className="text-3xl font-bold text-center mb-10">Family Dashboard</h1> */}
        <div className="space-y-10">
          <section>
            <h2 className="text-2xl font-semibold mb-4">Family Tree</h2>
            <FamilyTree />
          </section>
          {/* <section>
            <h2 className="text-2xl font-semibold mb-4">Members</h2>
            <Members />
          </section>
          <section>
            <h2 className="text-2xl font-semibold mb-4">Generations</h2>
            <Generations />
          </section> */}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
