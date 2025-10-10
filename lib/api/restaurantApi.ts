import api from "../axios";

export const restaurantApi = {
    getRestaurantById: (id: string) => {
        return api.get(`/restaurant/${id}`);
    },
};
