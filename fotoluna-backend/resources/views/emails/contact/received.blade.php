@component('mail::message')
# Nuevo mensaje desde el formulario de contacto

**Nombre:** {{ $data['firstName'] }} {{ $data['lastName'] }}  
**Email:** {{ $data['email'] }}  
**Teléfono:** {{ $data['phone'] ?? 'No proporcionado' }}  
**Asunto:** {{ $data['select'] }}  

---

## Mensaje:

{{ $data['message'] }}

@endcomponent
