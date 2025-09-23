
import AccountService from "./account.service";
export default (): Array<() => Promise<any>> => {
  return [
    async () => ({ default: AccountService }),
  ];
};
