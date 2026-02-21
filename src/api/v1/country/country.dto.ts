export type createCountryTypes = {
  name: string;
  code: string;
  status?: 'ACTIVE' | 'INACTIVE';
};

export interface ICountryFindAllParams {
  search?: string;
  status?: 'ACTIVE' | 'INACTIVE';
}
