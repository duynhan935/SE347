// Common images
import Logo from "@/assets/Common/Logo.png";

// HomePage images
import Burger from "@/assets/HomePage/burger.png";
import FeedYourEmployee from "@/assets/HomePage/feedyouremployee.png";
import FoodEat from "@/assets/HomePage/foodeat.png";
import Hero from "@/assets/HomePage/hero.png";
import Leaf from "@/assets/HomePage/leaf.png";
import Noodles from "@/assets/HomePage/noodles.png";
import Partner from "@/assets/HomePage/partner.svg";
import Pizza from "@/assets/HomePage/pizza.png";

// Restaurant images
import RestaurantBurger from "@/assets/Restaurant/Burger.png";

// Export theo category
export const CommonImages = {
    Logo,
};

export const HomePageImages = {
    Burger,
    FeedYourEmployee,
    FoodEat,
    Hero,
    Leaf,
    Noodles,
    Partner,
    Pizza,
};

export const RestaurantImages = {
    Burger: RestaurantBurger,
};

// Export tất cả images
export const Images = {
    Common: CommonImages,
    HomePage: HomePageImages,
    Restaurant: RestaurantImages,
};

// Export individual (với alias để tránh conflict)
export {
    Logo,
    Burger as HomePageBurger,
    FeedYourEmployee,
    FoodEat,
    Hero,
    Leaf,
    Noodles,
    Partner,
    Pizza,
    RestaurantBurger,
};

export default Images;
