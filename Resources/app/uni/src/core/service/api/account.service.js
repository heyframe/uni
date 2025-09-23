import ApiService from "@/core/service/api.service";

class AccountService extends ApiService {
  constructor(httpClient) {
    super(httpClient);
    this.name = 'accountService';
  }

  loginByEmail(email, pass) {
    return this.httpClient.invoke("loginCustomer post /account/login", {
      body: {
        username: email,
        password: pass,
      },
    })
      .then((res) => {
        console.log(res)
      });
  }
}
export default AccountService;
