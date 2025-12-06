export default function StatsCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

      <div className="bg-white dark:bg-gray-700 p-6 shadow rounded-2xl">
        <h2 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Total Members</h2>
        <p className="text-3xl font-bold text-gray-900 dark:text-white">25+</p>
      </div>

      <div className="bg-white dark:bg-gray-700 p-6 shadow rounded-2xl">
        <h2 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Generations</h2>
        <p className="text-3xl font-bold text-gray-900 dark:text-white">4</p>
      </div>

      <div className="bg-white dark:bg-gray-700 p-6 shadow rounded-2xl">
        <h2 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">New Additions</h2>
        <p className="text-3xl font-bold text-gray-900 dark:text-white">3</p>
      </div>

    </div>
  );
}
