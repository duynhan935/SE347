"use client";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const faqs = [
        {
                id: "item-1",
                question: "What is FoodEats?",
                answer: "FoodEats is a technology company that provides logistics services to both vendors and consumers. This potentially allows food vendors to deliver meals seamlessly while also providing consumers with an easy platform to order meals from their favourite restaurants in their city.",
        },
        {
                id: "item-2",
                question: "What location do we provide service?",
                answer: "We are currently available in major cities across the country. You can enter your address on our homepage to see a full list of restaurants available in your area.",
        },
        {
                id: "item-3",
                question: "What is the delivery fee?",
                answer: "The delivery fee varies depending on the restaurant and your distance from it. You can see the exact delivery fee for each restaurant before placing your order.",
        },
        {
                id: "item-4",
                question: "How can I become a rider?",
                answer: "We're always looking for new riders to join our team! Please visit our 'Careers' page and look for the 'Rider Application' to get started.",
        },
        {
                id: "item-5",
                question: "How can I become a partner?",
                answer: "If you own a restaurant and would like to partner with FoodEats, please fill out the 'Partner With Us' form on our website, and our team will get in touch with you shortly.",
        },
];

export default function FaqAccordion() {
        return (
                <div className="w-full max-w-3xl mx-auto">
                        <Accordion type="single" collapsible defaultValue="item-1">
                                {faqs.map((faq) => (
                                        <AccordionItem key={faq.id} value={faq.id}>
                                                <AccordionTrigger className="text-left font-semibold text-lg hover:no-underline">
                                                        {faq.question}
                                                </AccordionTrigger>
                                                <AccordionContent className="text-base text-brand-grey">
                                                        {faq.answer}
                                                </AccordionContent>
                                        </AccordionItem>
                                ))}
                        </Accordion>
                </div>
        );
}
