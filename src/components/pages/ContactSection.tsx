import React, { useState } from 'react';
import { Send, Mail, MapPin, Phone } from 'lucide-react';

interface ContactSectionProps {
  t: (key: string) => string;
}

const ContactSection: React.FC<ContactSectionProps> = ({ t }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log('Form submitted:', formData);
  };

  return (
    <div className="max-w-6xl mx-auto">
      <h2 className="font-jersey text-4xl md:text-6xl text-[#fffc00] mb-12 text-center">
        {t('contact.title')}
      </h2>
      
      <div className="grid md:grid-cols-2 gap-12">
        <div>
          <p className="font-ubuntu text-lg text-white mb-8">
            {t('contact.info')}
          </p>
          
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <Mail size={24} className="text-[#85fbff]" />
              <span className="font-ubuntu text-white">hello@bitsbytes.studio</span>
            </div>
            
            <div className="flex items-center gap-4">
              <Phone size={24} className="text-[#85fbff]" />
              <span className="font-ubuntu text-white">+420 123 456 789</span>
            </div>
            
            <div className="flex items-center gap-4">
              <MapPin size={24} className="text-[#85fbff]" />
              <span className="font-ubuntu text-white">Prague, Czech Republic</span>
            </div>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <input
              type="text"
              name="name"
              placeholder={t('contact.name')}
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 bg-black/50 border border-[#85fbff] rounded-lg text-white placeholder-white/60 font-ubuntu focus:border-[#fffc00] focus:outline-none transition-colors"
            />
          </div>
          
          <div>
            <input
              type="email"
              name="email"
              placeholder={t('contact.email')}
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 bg-black/50 border border-[#85fbff] rounded-lg text-white placeholder-white/60 font-ubuntu focus:border-[#fffc00] focus:outline-none transition-colors"
            />
          </div>
          
          <div>
            <textarea
              name="message"
              placeholder={t('contact.message')}
              value={formData.message}
              onChange={handleChange}
              required
              rows={5}
              className="w-full px-4 py-3 bg-black/50 border border-[#85fbff] rounded-lg text-white placeholder-white/60 font-ubuntu focus:border-[#fffc00] focus:outline-none transition-colors resize-none"
            />
          </div>
          
          <button
            type="submit"
            className="w-full bg-[#fffc00] text-black font-ubuntu font-bold py-3 rounded-lg hover:bg-[#85fbff] transition-colors duration-300 flex items-center justify-center gap-2"
          >
            <Send size={20} />
            {t('contact.send')}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ContactSection;
