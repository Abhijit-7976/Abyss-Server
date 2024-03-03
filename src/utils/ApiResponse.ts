export class ApiResponse {
  status: "success" = "success";
  constructor(
    public statusCode: number,
    public data: {} | [] | null,
    public message: string
  ) {}
}
