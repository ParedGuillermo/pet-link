import { useState, useRef } from 'react';
import { supabase } from '../services/supabase';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { FiUpload, FiX } from 'react-icons/fi';

const PetForm = () => {
  const { user } = useAuth();
  const fileInputRef = useRef(null);
  const [formData, setFormData] = useState({
    name: '',
    species: 'dog',
    breed: '',
    age: '',
    care_notes: '',
    medical_notes: '',
    photo: null
  });
  const [previewUrl, setPreviewUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const speciesOptions = [
    { value: 'dog', label: 'Perro' },
    { value: 'cat', label: 'Gato' },
    { value: 'bird', label: 'Ave' },
    { value: 'other', label: 'Otro' }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.match('image.*')) {
      setFormData(prev => ({ ...prev, photo: file }));
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const removePhoto = () => {
    setFormData(prev => ({ ...prev, photo: null }));
    setPreviewUrl('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // 1. Subir imagen si existe
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

      // 2. Insertar datos en Supabase
      const { error } = await supabase.from('pets').insert([{
        owner_id: user.id,
        name: formData.name,
        species: formData.species,
        breed: formData.breed,
        age: formData.age ? parseInt(formData.age) : null,
        care_notes: formData.care_notes,
        medical_notes: formData.medical_notes,
        photo_url: photoUrl,
        is_approved: false // Requiere aprobación del admin
      }]);

      if (error) throw error;

      // 3. Resetear formulario
      setSuccess(true);
      setFormData({
        name: '',
        species: 'dog',
        breed: '',
        age: '',
        care_notes: '',
        medical_notes: '',
        photo: null
      });
      removePhoto();

      // Ocultar mensaje de éxito después de 5 segundos
      setTimeout(() => setSuccess(false), 5000);
    } catch (error) {
      console.error('Error al registrar mascota:', error.message);
      alert(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-md mx-auto p-6 bg-white rounded-xl shadow-md"
    >
      <h2 className="text-2xl font-baloo text-pet-brown mb-6 text-center">
        Registra tu Mascota
      </h2>

      {success && (
        <div className="mb-4 p-3 bg-green-100 text-green-800 rounded-lg text-center">
          ¡Registro exitoso! El administrador revisará tu solicitud.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Campo Nombre */}
        <div>
          <label className="block text-sm font-poppins text-pet-brown mb-1">
            Nombre de la mascota *
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full p-2 border border-pet-orange rounded-lg focus:ring-2 focus:ring-pet-yellow"
            required
          />
        </div>

        {/* Campo Especie */}
        <div>
          <label className="block text-sm font-poppins text-pet-brown mb-1">
            Especie *
          </label>
          <select
            name="species"
            value={formData.species}
            onChange={handleChange}
            className="w-full p-2 border border-pet-orange rounded-lg focus:ring-2 focus:ring-pet-yellow"
            required
          >
            {speciesOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Campo Raza */}
        <div>
          <label className="block text-sm font-poppins text-pet-brown mb-1">
            Raza
          </label>
          <input
            type="text"
            name="breed"
            value={formData.breed}
            onChange={handleChange}
            className="w-full p-2 border border-pet-orange rounded-lg focus:ring-2 focus:ring-pet-yellow"
          />
        </div>

        {/* Campo Edad */}
        <div>
          <label className="block text-sm font-poppins text-pet-brown mb-1">
            Edad (años)
          </label>
          <input
            type="number"
            name="age"
            min="0"
            max="30"
            value={formData.age}
            onChange={handleChange}
            className="w-full p-2 border border-pet-orange rounded-lg focus:ring-2 focus:ring-pet-yellow"
          />
        </div>

        {/* Campo Cuidados */}
        <div>
          <label className="block text-sm font-poppins text-pet-brown mb-1">
            Cuidados especiales
          </label>
          <textarea
            name="care_notes"
            value={formData.care_notes}
            onChange={handleChange}
            rows="2"
            className="w-full p-2 border border-pet-orange rounded-lg focus:ring-2 focus:ring-pet-yellow"
          />
        </div>

        {/* Campo Notas médicas */}
        <div>
          <label className="block text-sm font-poppins text-pet-brown mb-1">
            Notas médicas (alergias, medicamentos, etc.)
          </label>
          <textarea
            name="medical_notes"
            value={formData.medical_notes}
            onChange={handleChange}
            rows="2"
            className="w-full p-2 border border-pet-orange rounded-lg focus:ring-2 focus:ring-pet-yellow"
          />
        </div>

        {/* Campo Foto */}
        <div>
          <label className="block text-sm font-poppins text-pet-brown mb-1">
            Foto de la mascota
          </label>
          {previewUrl ? (
            <div className="relative">
              <img
                src={previewUrl}
                alt="Preview"
                className="w-full h-48 object-cover rounded-lg border border-pet-orange"
              />
              <button
                type="button"
                onClick={removePhoto}
                className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-md hover:bg-pet-cream"
              >
                <FiX className="text-pet-brown" />
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-center w-full">
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-pet-orange rounded-lg cursor-pointer hover:bg-pet-cream transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <FiUpload className="text-pet-orange text-2xl mb-2" />
                  <p className="text-sm text-pet-brown font-poppins">
                    Haz clic para subir una foto
                  </p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="hidden"
                />
              </label>
            </div>
          )}
          <p className="mt-1 text-xs text-pet-brown">
            Máximo 2MB. Formatos: JPG, PNG.
          </p>
        </div>

        {/* Botón de envío */}
        <button
          type="submit"
          disabled={isLoading}
          className={`w-full py-3 px-4 rounded-lg font-baloo text-white transition-colors ${
            isLoading ? 'bg-pet-orange opacity-70' : 'bg-pet-blue hover:bg-pet-yellow hover:text-pet-brown'
          }`}
        >
          {isLoading ? 'Registrando...' : 'Registrar Mascota'}
        </button>
      </form>
    </motion.div>
  );
};

export default PetForm;
