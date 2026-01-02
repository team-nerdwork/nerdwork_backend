export async function sendMail(to: string, subject: string, html: string) {
  try {
    const response = await this.resend.emails.send({
      from: `"Nerdwork" <${
        process.env.RESEND_FROM || "onboarding@resend.dev"
      }>`,
      to,
      subject,
      html,
    });

    // Optional: log or verify response
    if (response.error) {
      console.error("Email send error:", response.error);
      throw new Error("Failed to send email");
    }

    return response;
  } catch (error) {
    console.error("Email send exception:", error);
    throw new Error("Failed to send email");
  }
}
