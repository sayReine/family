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

const Generations: React.FC = () => {
  const generations = [
    {
      generation: "Generation 1",
      members: [
        { id: 1, name: "Mark", role: "Father" },
        { id: 2, name: "Anna", role: "Mother" },
      ],
    },
    {
      generation: "Generation 2",
      members: [
        { id: 3, name: "Paul", role: "Son" },
        { id: 4, name: "Sara", role: "Daughter" },
      ],
    },
    {
      generation: "Generation 3",
      members: [
        { id: 5, name: "Noah", role: "Grandson" },
        { id: 6, name: "Lily", role: "Granddaughter" },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gray-100 p-10">
      <h2 className="text-2xl font-semibold mb-6 text-center">Generations</h2>
      {generations.map((gen, index) => (
        <div key={index} className="mb-8">
          <h3 className="text-xl font-medium mb-4">{gen.generation}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {gen.members.map((member) => (
              <Card key={member.id} person={member} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Generations;
