import burgerImage from "@/assets/Restaurant/Burger.png"; // Import ảnh nền
import CheckoutPageContainer from "@/components/client/Checkout/CheckoutContainer";

export default function CheckoutPage() {
        return (
                <section>
                        <CheckoutPageContainer backgroundImage={burgerImage} />
                </section>
        );
}
