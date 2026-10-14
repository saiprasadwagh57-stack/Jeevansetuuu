export default function handler(req: any, res: any) {
  res.status(200).json({
    status: "healthy",
    system: "Jeevan Setu Healthcare Network",
    timestamp: new Date().toISOString(),
  });
}
