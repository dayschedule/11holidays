import { Bindings } from "../types/binding";
import { Email, EmailResponse } from "../types/email";

export const sendMandrillEmail = async (
    env: Bindings,
    email: Email,
): Promise<EmailResponse> => {
    const payload = {
        key: env.MANDRILL_KEY,
        message: {
            from_email: 'support@11holidays.com',
            from_name: '11holidays',
            to: (Array.isArray(email.to) ? email.to : [email.to]).map((e) => ({
                email: e,
                type: "to",
            })),
            subject: email.subject,
            html: email.html,
            attachments: email.attachments?.length
                ? email.attachments.map((att) => ({
                    type: att.content_type,
                    name: att.filename,
                    content: Buffer.from(att.content).toString("base64"),
                }))
                : undefined,
            headers: {
                "Reply-To": email.replyTo,
                ...email.headers,
            },
        },
    };

    const response = await fetch(
        "https://mandrillapp.com/api/1.0/messages/send.json",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        },
    );

    if (!response.ok) {
        throw new Error(`Mandrill Error: ${response.statusText}`);
    }

    const result: any = await response.json();
    if (result[0]?.status === "rejected" || result[0]?.status === "invalid") {
        throw new Error(
            `Mandrill Error: ${result[0]?.reject_reason || "Email rejected"}`,
        );
    }

    return {
        success: true,
        id: result[0]?._id,
    };
};