import { View, ScrollView } from 'react-native';
import { Text } from '@/components/ui/text';
import { Stack } from 'expo-router';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const FAQ_DATA = [
  {
    question: 'What is this app about?',
    answer: 'This is a healthcare simulation learning platform designed to help you improve your clinical skills through immersive online courses and resources.'
  },
  {
    question: 'How do I purchase a course?',
    answer: "Navigate to the Courses tab, select a course you're interested in, and click on the 'Enroll' or 'Purchase' button to complete your registration."
  },
  {
    question: 'Do I receive a certificate upon completion?',
    answer: 'Yes, upon successfully completing a course and passing the required assessments, you will receive a digital certificate of completion.'
  },
  {
    question: 'Who are the courses designed for?',
    answer: 'Our courses are primarily designed for nursing and paramedic students, as well as practicing healthcare professionals looking to update their clinical skills.'
  },
  {
    question: 'Can I access the courses offline?',
    answer: 'Currently, you need an active internet connection to access the course materials, videos, and simulations.'
  },
  {
    question: 'What payment methods are accepted?',
    answer: 'We accept all major credit/debit cards, as well as popular digital wallets for seamless transactions.'
  },
  {
    question: 'How long do I have access to a course?',
    answer: 'Most courses come with lifetime access, allowing you to review the materials whenever you need to refresh your knowledge.'
  },
  {
    question: 'Is there any practical training included?',
    answer: 'The app focuses on digital healthcare simulation. While it provides robust theoretical and scenario-based knowledge, it is designed to supplement hands-on clinical practice.'
  },
  {
    question: 'How can I track my learning progress?',
    answer: 'You can track your progress in the My Courses section, which shows your completed modules, upcoming lessons, and earned certificates.'
  },
  {
    question: 'How can I get technical support?',
    answer: 'If you experience any issues, you can reach out to our support team via the Contact Us section or tap the WhatsApp support button.'
  },
];

export default function FaqsScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'FAQs', headerBackTitle: 'Back' }} />
      <ScrollView className="flex-1 bg-white p-6 dark:bg-neutral-950">
        <Text className="mb-6 text-2xl font-bold dark:text-white">Frequently Asked Questions</Text>
        
        <Accordion type="multiple" collapsible className="mb-10 w-full" defaultValue={['item-0']}>
          {FAQ_DATA.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger>
                <Text>{faq.question}</Text>
              </AccordionTrigger>
              <AccordionContent>
                <Text className="text-gray-600 dark:text-gray-400">
                  {faq.answer}
                </Text>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </ScrollView>
    </>
  );
}
