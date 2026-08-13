type GoogleCredentialResponse = {
  credential?: string;
  select_by?: string;
};

type GoogleIdConfiguration = {
  client_id: string;
  callback: (response: GoogleCredentialResponse) => void;
};

type GoogleButtonConfiguration = {
  theme?: "outline" | "filled_blue" | "filled_black";
  size?: "large" | "medium" | "small";
  type?: "standard" | "icon";
  shape?: "rectangular" | "pill" | "circle" | "square";
  text?: "signin_with" | "signup_with" | "continue_with" | "signin";
  width?: string | number;
};

interface Window {
  google?: {
    accounts: {
      id: {
        initialize: (configuration: GoogleIdConfiguration) => void;
        renderButton: (
          parent: HTMLElement,
          options: GoogleButtonConfiguration,
        ) => void;
        cancel: () => void;
      };
    };
  };
}
