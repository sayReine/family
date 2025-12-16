import React from "react";

interface PersonCardProps {
  name: string;
  birthYear: number;
  image: string;
  variant?: "primary" | "secondary";
  badge?: string;
}

const PersonCard: React.FC<PersonCardProps> = ({
  name,
  birthYear,
  image,
  variant = "secondary",
  badge,
}) => {
  const isPrimary = variant === "primary";

  return (
    <div className="relative w-64 rounded-xl overflow-hidden shadow-lg bg-white dark:bg-gray-800">
      {badge && (
        <span className="absolute top-3 right-3 bg-red-600 text-white text-xs font-semibold px-3 py-1 rounded">
          {badge}
        </span>
      )}

      <img
        src={image}
        alt={name}
        className="w-full h-72 object-cover"
      />

      <div
        className={
          isPrimary
            ? "bg-red-600 text-white text-center py-4"
            : "bg-white dark:bg-gray-700 text-center py-4"
        }
      >
        <h3 className="font-semibold text-lg dark:text-gray-300">{name}</h3>
        <p className={isPrimary ? "text-white" : "text-gray-500 dark:text-gray-300"}>
          ({birthYear})
        </p>
      </div>
    </div>
  );
};

export default PersonCard;
