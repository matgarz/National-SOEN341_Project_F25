interface StarRatingProps {
  rating: 1 | 2 | 3 | 4 | 5;
  max?: number;
}

export function StarRating({ rating, max = 5 }: StarRatingProps) {
  return (
    <div className="flex gap-1">
      {Array.from({ length: max }, (_, i) => {
        const filled = i < rating;
        return (
          <span key={i} className={filled ? "text-yellow-400" : "text-gray-300"}>
            ★
          </span>
        );
      })}
    </div>
  );
}
