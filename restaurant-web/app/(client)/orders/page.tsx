import burgerImage from "@/assets/Restaurant/Burger.png";
import OrdersPageContainer from "@/components/client/Orders/OrdersPageContainer";
import { StaticImageData } from "next/image";
type OrderItem = {
        id: string;
        productId: number;
        name: string;
        shopName: string;
        price: number;
        image: StaticImageData;
};

type Order = {
        id: number;
        date: string;
        items: OrderItem[];
};

const fakeOrders: Order[] = [
        {
                id: 1,
                date: "2025-09-25",
                items: [
                        {
                                id: "12345678910",
                                productId: 101,
                                name: "Eggs Benedict Burger",
                                shopName: "The Burger Shop",
                                price: 50,
                                image: burgerImage,
                        },
                        {
                                id: "12345678911",
                                productId: 301,
                                name: "Classic Salad",
                                shopName: "The Salad Bar",
                                price: 30,
                                image: burgerImage,
                        },
                ],
        },
        {
                id: 2,
                date: "2025-09-24",
                items: [
                        {
                                id: "98765432100",
                                productId: 102,
                                name: "Classic Cheeseburger",
                                shopName: "The Burger Shop",
                                price: 60,
                                image: burgerImage,
                        },
                ],
        },
        {
                id: 3,
                date: "2025-09-22",
                items: [
                        {
                                id: "55544433322",
                                productId: 101,
                                name: "Eggs Benedict Burger",
                                shopName: "The Burger Shop",
                                price: 50,
                                image: burgerImage,
                        },
                ],
        },
];
const OrdersPage = () => {
        return (
                <section>
                        <OrdersPageContainer orders={fakeOrders} />
                </section>
        );
};

export default OrdersPage;
