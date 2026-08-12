import intlTelInput from "intl-tel-input";
import "intl-tel-input/build/css/intlTelInput.css";
import utilsUrl from "intl-tel-input/build/js/utils.js?url";

const IPINFO_TOKEN = import.meta.env.VITE_IPINFO_TOKEN;
const DEFAULT_COUNTRY = "ua";

document.addEventListener("DOMContentLoaded", () => {
  const formContainer = document.querySelector("form-container"),
    countryData = window.intlTelInputGlobals.getCountryData(),
    input = document.querySelector("#phone"),
    addressDropdown = document.querySelector("#input-country"),
    errorMsg = document.querySelector("#error-msg"),
    validMsg = document.querySelector("#valid-msg"),
    scrollToForm = document.querySelector(".scroll-to-form"),
    iti = intlTelInput(input, {
      hiddenInput: "full_phone",
      separateDialCode: true,
      initialCountry: "auto",
      geoIpLookup: (countrySet) => {
        if (!IPINFO_TOKEN) {
          countrySet(DEFAULT_COUNTRY);
          return;
        }
        fetch(`https://api.ipinfo.io/lite/me?token=${IPINFO_TOKEN}`)
          .then((res) => (res.ok ? res.json() : Promise.reject()))
          .then((response) => {
            countrySet(
              (response.country_code || DEFAULT_COUNTRY).toLowerCase(),
            );
          })
          .catch(() => {
            countrySet(DEFAULT_COUNTRY);
          });
      },
      utilsScript: utilsUrl,
    }),
    errorMap = ["✘", "✘", "✘", "✘", "✘"],
    countryList = new Intl.DisplayNames(["en"], { type: "region" }),
    reset = () => {
      input.classList.remove("error");
      errorMsg.textContent = "";
      errorMsg.classList.add("hide");
      validMsg.classList.add("hide");
    };

  if (!formContainer.classList.contains("contact")) {
    formContainer.classList.add("contact");
  }

  if (
    !formContainer.parentNode.classList.contains("content-wrapper") &&
    formContainer.parentNode.classList.contains("row")
  ) {
    formContainer.parentNode.classList.add("content-wrapper");
  }

  input.addEventListener("blur", () => {
    reset();
    if (input.value.trim()) {
      if (iti.isValidNumber()) {
        validMsg.classList.remove("hide");
      } else {
        input.classList.add("error");
        const errorCode = iti.getValidationError();
        errorMsg.textContent = errorMap[errorCode];
        errorMsg.classList.remove("hide");
      }
    }
  });
  input.addEventListener("keyup", () => {
    reset();
    if (input.value.trim()) {
      if (iti.isValidNumber()) {
        validMsg.classList.remove("hide");
      } else {
        input.classList.add("error");
        const errorCode = iti.getValidationError();
        errorMsg.textContent = errorMap[errorCode];
        errorMsg.classList.remove("hide");
      }
    }
  });

  input.addEventListener("change", reset);

  for (let i = 0; i < countryData.length; i++) {
    const country = countryData[i];
    const optionNode = document.createElement("option");
    optionNode.value = country.iso2;
    const textNode = document.createTextNode(
      countryList.of(country.iso2.toUpperCase()),
    );
    optionNode.appendChild(textNode);
    addressDropdown.appendChild(optionNode);
  }

  const dropDownFlagList = document.querySelectorAll(".iti__country-name");
  dropDownFlagList.forEach((e) => {
    const countryValue = e.parentElement
        .getAttribute("data-country-code")
        .toUpperCase(),
      editedCountryName = countryList.of(countryValue);
    e.textContent = editedCountryName;
  });

  addressDropdown.value = iti.getSelectedCountryData().iso2;

  input.addEventListener("countrychange", () => {
    addressDropdown.value = iti.getSelectedCountryData().iso2;
    if (addressDropdown.classList.contains("error")) {
      reset();
      input.value = "";
    }
  });

  addressDropdown.addEventListener("change", function () {
    iti.setCountry(this.value);
    reset();
    input.value = "";
  });

  if (scrollToForm) {
    document.querySelectorAll(".scroll-to-form").forEach((el) => {
      el.addEventListener("click", () => {
        document.querySelector("form-container").scrollIntoView({
          behavior: "smooth",
        });
        document.querySelector("form-container .input__name").focus();
      });
    });
  }

  input.addEventListener("keydown", phoneFieldOnlyDigits);

  input.addEventListener("keyup", () => {
    if (errorMsg.textContent.includes("undefined")) {
      errorMsg.textContent = "✘";
    }
  });

  document
    .querySelector(".contact__form-button")
    .addEventListener("click", () => {
      alert("Form is temporarily disabled 😫");
      const tempCountry = addressDropdown.value;
      document.querySelector(".contact__form").reset();
      addressDropdown.value = tempCountry;
    });

  function phoneFieldOnlyDigits(e) {
    if (
      (e.key >= 0 && e.key <= 9) ||
      e.key === "+" ||
      e.key === "-" ||
      e.key === "/" ||
      e.key === "." ||
      e.key === "Backspace" ||
      e.key === "Delete" ||
      e.key === "ArrowLeft" ||
      e.key === "ArrowRight" ||
      e.key === "End" ||
      e.key === "Home"
    ) {
      return true;
    } else {
      e.preventDefault();
    }
  }
});
