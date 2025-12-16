export default function StatsCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

      <div className="bg-gray-800 dark:bg-gray-900 p-6 shadow rounded-2xl">
        <h2 className="text-lg font-semibold mb-2 text-white">Total Members</h2>
        <p className="text-3xl font-bold text-white">25+</p>
      </div>

      <div className="bg-gray-800 dark:bg-gray-900 p-6 shadow rounded-2xl">
        <h2 className="text-lg font-semibold mb-2 text-white">Generations</h2>
        <p className="text-3xl font-bold text-white">4</p>
      </div>

      <div className="bg-gray-800 dark:bg-gray-900 p-6 shadow rounded-2xl">
        <h2 className="text-lg font-semibold mb-2 text-white">New Additions</h2>
        <p className="text-3xl font-bold text-white">3</p>
      </div>

    </div>
  );
}
