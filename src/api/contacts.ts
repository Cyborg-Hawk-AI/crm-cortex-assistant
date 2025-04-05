
import { Contact } from '@/utils/types';

export const createContact = async (contact: Contact): Promise<Contact> => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // In a real implementation, this would be a fetch call to your backend
  const newContact: Contact = {
    ...contact,
    id: contact.id || crypto.randomUUID(),
  };
  
  // For development, we can store in localStorage
  const existingContacts = JSON.parse(localStorage.getItem('contacts') || '[]');
  localStorage.setItem('contacts', JSON.stringify([...existingContacts, newContact]));
  
  console.log('Created contact:', newContact);
  return newContact;
};

export const getContacts = async (): Promise<Contact[]> => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  // In a real implementation, this would be a fetch call to your backend
  const contacts = JSON.parse(localStorage.getItem('contacts') || '[]');
  return contacts;
};

export const updateContact = async (contact: Contact): Promise<Contact> => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // In a real implementation, this would be a fetch call to your backend
  const contacts = JSON.parse(localStorage.getItem('contacts') || '[]');
  const updatedContacts = contacts.map((c: Contact) => c.id === contact.id ? contact : c);
  localStorage.setItem('contacts', JSON.stringify(updatedContacts));
  
  return contact;
};

export const deleteContact = async (contactId: string): Promise<void> => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // In a real implementation, this would be a fetch call to your backend
  const contacts = JSON.parse(localStorage.getItem('contacts') || '[]');
  const filteredContacts = contacts.filter((c: Contact) => c.id !== contactId);
  localStorage.setItem('contacts', JSON.stringify(filteredContacts));
};
