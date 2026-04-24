// js/email.js
const EMAILJS_CONFIG = {
    PUBLIC_KEY: 'OeCSnjYMl3_EiMBct',
    SERVICE_ID: 'service_asd2cip',
    TEMPLATE_ID: 'template_azca5v4'
};

if (typeof emailjs !== 'undefined') {
    emailjs.init(EMAILJS_CONFIG.PUBLIC_KEY);
    console.log('📧 EmailJS inicializado correctamente');
}

const EmailService = {
    
    async enviarTicketPorEmail(reserva) {
        console.log('📧 Enviando ticket a:', reserva.email);
        
        try {
            const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
            const [y, m, d] = reserva.fecha.split('-');
            const fechaFormateada = `${parseInt(d)} de ${meses[parseInt(m)-1]} de ${y}`;
            
            const templateParams = {
                to_email: reserva.email,        // 👈 CLAVE PARA EL DESTINATARIO
                to_name: reserva.nombre,
                reservation_date: fechaFormateada,
                reservation_time: `${reserva.horaEntrada} - ${reserva.horaSalida}`,
                reservation_persons: reserva.personas,
                reservation_area: reserva.area === 'fumar' ? 'Fumar 🚬' : 'No Fumar 🚭',
                reservation_notes: reserva.notas || 'Ninguna',
                reservation_id: reserva.id.substring(0, 8),
                year: new Date().getFullYear()
            };
            
            console.log('📧 Parámetros:', templateParams);
            
            const response = await emailjs.send(
                EMAILJS_CONFIG.SERVICE_ID,
                EMAILJS_CONFIG.TEMPLATE_ID,
                templateParams
            );
            
            console.log('✅ Email enviado:', response);
            UI.toast(`📧 Ticket enviado a ${reserva.email}`, 'ok');
            return true;
            
        } catch(error) {
            console.error('❌ Error:', error);
            UI.toast('Error al enviar email: ' + (error.text || error.message), 'err');
            return false;
        }
    }
};