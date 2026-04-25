const EMAILJS_CONFIG = { PUBLIC_KEY: 'OeCSnjYMl3_EiMBct', SERVICE_ID: 'service_asd2cip', TEMPLATE_ID: 'template_azca5v4' };
if (typeof emailjs !== 'undefined') { emailjs.init(EMAILJS_CONFIG.PUBLIC_KEY); console.log('📧 EmailJS inicializado'); }
const EmailService = {
  async enviarTicketPorEmail(reserva) {
    try {
      const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
      const [y, m, d] = reserva.fecha.split('-');
      const fechaFormateada = `${parseInt(d)} de ${meses[parseInt(m)-1]} de ${y}`;
      const templateParams = { to_email: reserva.email, to_name: reserva.nombre, reservation_date: fechaFormateada, reservation_time: `${reserva.horaEntrada} - ${reserva.horaSalida}`, reservation_persons: reserva.personas, reservation_area: reserva.area === 'fumar' ? 'Fumar 🚬' : 'No Fumar 🚭', reservation_notes: reserva.notas || 'Ninguna', reservation_id: reserva.id.substring(0, 8), year: new Date().getFullYear() };
      await emailjs.send(EMAILJS_CONFIG.SERVICE_ID, EMAILJS_CONFIG.TEMPLATE_ID, templateParams);
      console.log('✅ Email enviado');
      if (typeof UI !== 'undefined') UI.toast(`📧 Ticket enviado a ${reserva.email}`, 'ok');
      return true;
    } catch(e) { console.error(e); if (typeof UI !== 'undefined') UI.toast('Error al enviar email', 'err'); return false; }
  }
};
window.EmailService = EmailService;