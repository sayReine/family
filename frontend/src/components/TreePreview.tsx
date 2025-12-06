export default function TreePreview() {
  const familyTree = {
    name: "John Smith",
    spouse: "Jane Smith",
    children: [
      {
        name: "Michael Smith",
        spouse: "Sarah Smith",
        children: [
          { name: "Emma Smith", spouse: null },
          { name: "Liam Smith", spouse: null }
        ]
      },
      {
        name: "Emily Johnson",
        spouse: "David Johnson",
        children: [
          { name: "Olivia Johnson", spouse: null },
          { name: "Noah Johnson", spouse: null }
        ]
      },
      {
        name: "Robert Smith",
        spouse: "Lisa Smith",
        children: [
          { name: "Sophia Smith", spouse: null }
        ]
      }
    ]
  };

  const renderPerson = (person: any, level: number = 0) => (
    <div key={person.name} className={`flex flex-col items-center ${level > 0 ? 'mt-4' : ''}`}>
      <div className="bg-blue-100 dark:bg-blue-900 border-2 border-blue-300 dark:border-blue-700 rounded-lg p-3 text-center min-w-[120px]">
        <div className="font-semibold text-gray-900 dark:text-white">{person.name}</div>
        {person.spouse && (
          <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">
            & {person.spouse}
          </div>
        )}
      </div>
      {person.children && person.children.length > 0 && (
        <div className="flex flex-wrap justify-center gap-4 mt-4">
          {person.children.map((child: any) => renderPerson(child, level + 1))}
        </div>
      )}
    </div>
  );

  return (
    <div className="mt-8 bg-white dark:bg-gray-700 p-6 shadow rounded-2xl">
      <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Family Tree Preview</h2>

      <div className="overflow-x-auto">
        <div className="min-w-max">
          {renderPerson(familyTree)}
        </div>
      </div>

      <div className="mt-4 text-sm text-gray-600 dark:text-gray-300">
        This is a sample family tree showing 3 generations. The actual tree will be dynamically generated from your family data.
      </div>
    </div>
  );
}
