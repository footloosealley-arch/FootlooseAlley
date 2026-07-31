import CustomWhatsAppComposer from "@/components/whatsapp/CustomWhatsAppComposer";
import WhatsAppCommunicationCenter from "@/components/whatsapp/WhatsAppCommunicationCenter";

export default function WhatsAppPage() {
  return (
    <div className="space-y-6">
      <CustomWhatsAppComposer />
      <WhatsAppCommunicationCenter />
    </div>
  );
}
