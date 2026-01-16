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

// AboutPage images
import Chef from "@/assets/About/chef.png";
import DeliveryGreen from "@/assets/About/delivery-green.png";
import DeliveryRed from "@/assets/About/delivery-red.png";
import OurMission from "@/assets/About/ourmission.png";
import OurStory from "@/assets/About/ourstory.png";

import yeye from "@/assets/Common/yeye.jpg";

// Export theo category
export const CommonImages = {
    Logo,
    yeye,
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

export const AboutPageImages = {
    Chef,
    DeliveryGreen,
    DeliveryRed,
    OurMission,
    OurStory,
};

// Export all images
export const Images = {
    Common: CommonImages,
    HomePage: HomePageImages,
    Restaurant: RestaurantImages,
    AboutPage: AboutPageImages,
};

// Export individual (with alias to avoid conflict)
export {
    Chef,
    DeliveryGreen,
    DeliveryRed,
    FeedYourEmployee,
    FoodEat,
    Hero,
    Burger as HomePageBurger,
    Leaf,
    Logo,
    Noodles,
    OurMission,
    OurStory,
    Partner,
    Pizza,
    RestaurantBurger
};

export default Images;
