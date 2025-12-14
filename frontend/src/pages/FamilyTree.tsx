import React from "react";

interface Person {
  id: number;
  name: string;
  role: string;
  image?: string;
}

const Card: React.FC<{ person: Person }> = ({ person }) => {
  return (
    <div className="bg-white rounded-xl shadow-md p-4 text-center w-40 relative">
      <div className="w-16 h-16 mx-auto rounded-full bg-gray-200 overflow-hidden mb-2">
        {person.image && (
          <img
            src={person.image}
            alt={person.name}
            className="w-full h-full object-cover"
          />
        )}
      </div>
      <h3 className="text-sm font-semibold">{person.name}</h3>
      <p className="text-xs text-gray-500">{person.role}</p>
    </div>
  );
};

const VerticalConnector: React.FC = () => (
  <div className="w-px h-8 bg-gray-400 mx-auto" />
);

const FamilyTree: React.FC = () => {
  const father: Person = { id: 1, name: "Mark", role: "Father" };
  const mother: Person = { id: 2, name: "Anna", role: "Mother" };

  const child1: Person = { id: 3, name: "Paul", role: "Son" };
  const child2: Person = { id: 4, name: "Sara", role: "Daughter" };

  const grandChild1: Person = { id: 5, name: "Noah", role: "Grandson" };
  const grandChild2: Person = { id: 6, name: "Lily", role: "Granddaughter" };

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center p-10">
      <div className="flex flex-col items-center">
        {/* Parents */}
        <div className="flex gap-20">
          <Card person={father} />
          <Card person={mother} />
        </div>

        <VerticalConnector />

        {/* Children */}
        <div className="flex gap-32">
          <div className="flex flex-col items-center">
            <Card person={child1} />
            <VerticalConnector />
            <Card person={grandChild1} />
          </div>

          <div className="flex flex-col items-center">
            <Card person={child2} />
            <VerticalConnector />
            <Card person={grandChild2} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default FamilyTree;
