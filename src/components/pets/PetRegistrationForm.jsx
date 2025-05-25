import { useState } from 'react';
import { supabase } from "../../services/supabase";
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

export default function PetRegistrationForm() {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    species: 'dog',
    breed: '',
    age: '',
    care_notes: '',
    photo: null
  });
  const [previewUrl, setPreviewUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, photo: file }));
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // 1. Subir imagen al almacenamiento
      let photoUrl = '';
      if (formData.photo) {
        const fileExt = formData.photo.name.split('.').pop();
        const fileName = `${user.id}-${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('pet-photos')
          .upload(fileName, formData.photo);

        if (uploadError) throw uploadError;
        photoUrl = supabase.storage.from('pet-photos').getPublicUrl(fileName).data.publicUrl;
      }

      // 2. Insertar registro en la tabla 'pets'
      const { error } = await supabase.from('pets').insert([{
        owner_id: user.id,
        ...formData,
        photo_url: photoUrl,
        age: parseInt(formData.age) || null
      }]);

      if (error) throw error;

      setSuccess(true);
      setFormData({
        name: '',
        species: 'dog',
        breed: '',
        age: '',
        care_notes: '',
        photo: null
      });
      setPreviewUrl('');
    } catch (error) {
      console.error('Error:', error.message);
      alert('Error al registrar mascota: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="max-w-md mx-auto p-6 bg-pet-cream rounded-lg shadow-lg"
    >
      <h2 className="text-2xl font-baloo text-pet-brown mb-4">Registra tu Mascota</h2>
      
      {success && (
        <div className="mb-4 p-3 bg-green-100 text-green-800 rounded">
          ¡Mascota registrada con éxito! Espera la aprobación del administrador.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Campo Nombre */}
        <div>
          <label className="block text-pet-brown font-poppins mb-1">Nombre *</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full p-2 border border-pet-orange rounded focus:ring-2 focus:ring-pet-yellow"
            required
          />
        </div>

        {/* Campo Especie */}
        <div>
          <label className="block text-pet-brown font-poppins mb-1">Especie *</label>
          <select
            name="species"
            value={formData.species}
            onChange={handleChange}
            className="w-full p-2 border border-pet-orange rounded focus:ring-2 focus:ring-pet-yellow"
            required
          >
            <option value="dog">Perro</option>
            <option value="cat">Gato</option>
            <option value="other">Otra</option>
          </select>
        </div>

        {/* Campos adicionales (raza, edad, cuidados) */}
        {/* ... */}

        {/* Campo Foto */}
        <div>
          <label className="block text-pet-brown font-poppins mb-1">Foto</label>
          <input
            type="file"
            accept="image/*"
            onChange={handlePhotoChange}
            className="block w-full text-sm text-pet-brown
              file:mr-4 file:py-2 file:px-4
              file:rounded file:border-0
              file:text-sm file:font-baloo
              file:bg-pet-blue file:text-pet-brown
              hover:file:bg-pet-yellow"
          />
          {previewUrl && (
            <div className="mt-2">
              <img src={previewUrl} alt="Vista previa" className="h-32 rounded-lg object-cover" />
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full py-2 px-4 rounded-lg font-baloo transition-colors ${
            isSubmitting 
              ? 'bg-pet-orange opacity-70' 
              : 'bg-pet-yellow hover:bg-pet-orange text-pet-brown'
          }`}
        >
          {isSubmitting ? 'Registrando...' : 'Registrar Mascota'}
        </button>
      </form>
    </motion.div>
  );
}