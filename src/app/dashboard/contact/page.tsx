"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card"

import MultilingualSectionComponent from "@/src/components/dashboard/MultilingualSectionComponent"
import { ContactData } from "@/src/api/types/contact/contactSection.types"
import {  LanguageConfig, MultilingualSectionData } from "@/src/api/types"

// Contact information data

// Sample contact data
const defaultContactData: ContactData = {
  badge: "Get in Touch",
  heading: "Contact Us",
  subheading: "Have questions or ready to start your digital transformation journey? Reach out to our team.",
  contactInfo: "Contact Information",
  contactInfoDesc: "Our team is ready to assist you with any questions or inquiries you may have.",
  phone: "Phone",
  phoneNumber: "+1 (555) 123-4567",
  email: "Email",
  emailAddress: "info@idigitex.com",
  office: "Office",
  address: {
    line1: "123 Innovation Drive",
    line2: "Suite 400",
    line3: "San Francisco, CA 94103"
  },
  formTitle: "Send Us a Message",
  fullName: "Full Name",
  fullNamePlaceholder: "John Doe",
  emailLabel: "Email",
  emailPlaceholder: "john@example.com",
  subject: "Subject",
  subjectPlaceholder: "How can we help you?",
  message: "Message",
  messagePlaceholder: "Tell us about your project or inquiry...",
  sendMessage: "Send Message",
  sending: "Sending...",
  messageSent: "Message Sent"
}

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
}

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 100, damping: 10 },
  },
}

/**
 * Contact page component
 * Displays contact information and a contact form with multilingual support
 */
export default function ContactPage() {
  const [loading, setLoading] = useState(true)
  const [formSubmitting, setFormSubmitting] = useState(false)
  const [formSubmitted, setFormSubmitted] = useState(false)
  const [contactData, setContactData] = useState<ContactData>(defaultContactData)
  const [contactSection, setContactSection] = useState<MultilingualSectionData | null>(null)
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    subject: "",
    message: ""
  })

  // Define languages for the multilingual section
  const languages: LanguageConfig[] = [
    { id: "lang1", label: "English" },
    { id: "lang2", label: "French" },
    { id: "lang3", label: "Spanish" },
  ]

  // Define fields for the contact section
  const contactFields: FieldConfig[] = [
    { id: "badge", label: "Badge Text", type: "text", required: true },
    { id: "heading", label: "Heading", type: "text", required: true },
    { id: "subheading", label: "Subheading", type: "textarea", required: true },
    { id: "contactInfo", label: "Contact Info Title", type: "text", required: true },
    { id: "contactInfoDesc", label: "Contact Info Description", type: "textarea", required: false },
    { id: "phone", label: "Phone Label", type: "text", required: true },
    { id: "phoneNumber", label: "Phone Number", type: "text", required: true },
    { id: "email", label: "Email Label", type: "text", required: true },
    { id: "emailAddress", label: "Email Address", type: "text", required: true },
    { id: "office", label: "Office Label", type: "text", required: true },
    { id: "addressLine", label: "Address", type: "text", required: true },
    { id: "formTitle", label: "Form Title", type: "text", required: true },
    { id: "fullNameField", label: "Full Name Field Label", type: "text", required: true },
    { id: "emailField", label: "Email Field Label", type: "text", required: true },
    { id: "subjectField", label: "Subject Field Label", type: "text", required: true },
    { id: "messageField", label: "Message Field Label", type: "text", required: true },
    { id: "sendButton", label: "Send Button Text", type: "text", required: true },
  ]

  // Handle form input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setFormSubmitting(true)
    
    // Simulate API call
    setTimeout(() => {
      setFormSubmitting(false)
      setFormSubmitted(true)
      setFormData({
        fullName: "",
        email: "",
        subject: "",
        message: ""
      })
      
      // Reset form submitted state after 3 seconds
      setTimeout(() => {
        setFormSubmitted(false)
      }, 3000)
    }, 1500)
  }

  // Simulate API fetch
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  return (
    <motion.div className="space-y-8 p-6" initial="hidden" animate="visible" variants={containerVariants}>
      {/* Page header */}
      <motion.div className="flex flex-col md:flex-row md:items-center justify-between gap-4" variants={itemVariants}>
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-500 to-indigo-500 bg-clip-text text-transparent">
            Contact Management
          </h1>
          <p className="text-muted-foreground mt-1">Manage your contact page content and multilingual information</p>
        </div>
    
      </motion.div>
      
      {/* Contact Section Component */}
      <motion.div variants={itemVariants}>
        <Card className="border border-slate-200 dark:border-slate-700 shadow-lg overflow-hidden">
          <CardContent className="p-6">
            <MultilingualSectionComponent
                sectionTitle="Multilingual Contact Section"
                sectionDescription="Manage your contact information in multiple languages."
                fields={contactFields}
                languages={languages}
                sectionData={contactSection}
                onSectionChange={setContactSection}
                addButtonLabel="Add Contact Section"
                editButtonLabel="Edit Contact Section"
                saveButtonLabel="Save Contact Section"
                sectionName="Contact"
                noDataMessage="No contact section added yet. Click the 'Add Contact Section' button to create one."
            />
          </CardContent>
        </Card>
      </motion.div>

    
    </motion.div>
  )
}