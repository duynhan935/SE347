import { FaRegStar, FaStar, FaStarHalfAlt } from "react-icons/fa";

const RatingStar = ({ rating }: { rating: number }) => {
        const stars = [];

        for (let i = 1; i <= 5; i++) {
                if (rating >= i) {
                        // ⭐ full star
                        stars.push(<FaStar key={i} className="text-yellow-500 inline-block" />);
                } else if (rating >= i - 0.5) {
                        // ⭐ half star
                        stars.push(<FaStarHalfAlt key={i} className="text-yellow-500 inline-block" />);
                } else {
                        // ⭐ empty star
                        stars.push(<FaRegStar key={i} className="text-yellow-500 inline-block" />);
                }
        }

        return <div className="flex space-x-1">{stars}</div>;
};

export default RatingStar;
