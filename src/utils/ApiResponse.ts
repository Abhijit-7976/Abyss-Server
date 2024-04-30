export class ApiResponse {
  status: "success" = "success";
  constructor(
    public statusCode: number,
    public data: object | [] | null,
    public message: string
  ) {}
}
