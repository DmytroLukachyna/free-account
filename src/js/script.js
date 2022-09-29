document.addEventListener('DOMContentLoaded', () => {
  const formContainer = document.querySelector('form-container'),
    countryData = window.intlTelInputGlobals.getCountryData(),
    input = document.querySelector('#phone'),
    addressDropdown = document.querySelector('#input-country'),
    errorMsg = document.querySelector('#error-msg'),
    validMsg = document.querySelector('#valid-msg'),
    scrollToForm = document.querySelector('.scroll-to-form'),
    iti = window.intlTelInput(input, {
      hiddenInput: 'full_phone',
      separateDialCode: true,
      initialCountry: 'auto',
      geoIpLookup: function (countrySet) {
        fetch('https://extreme-ip-lookup.com/json/')
          .then((res) => res.json())
          .then((response) => {
            countrySet(response.countryCode);
          })
          .catch(() => {
            console.log('Request failed, set Ukraine as default!');
            countrySet('ua');
          });
      },
      utilsScript: 'js/utils.min.js',
    }),
    errorMap = ['✘', '✘', '✘', '✘', '✘'],
    countryList = new Intl.DisplayNames(['en'], { type: 'region' }),
    reset = function () {
      input.classList.remove('error');
      errorMsg.textContent = '';
      errorMsg.classList.add('hide');
      validMsg.classList.add('hide');
    };

  if (!formContainer.classList.contains('contact')) {
    formContainer.classList.add('contact');
  }

  if (
    !formContainer.parentNode.classList.contains('content-wrapper') &&
    formContainer.parentNode.classList.contains('row')
  ) {
    formContainer.parentNode.classList.add('content-wrapper');
  }

  input.addEventListener('blur', function () {
    reset();
    if (input.value.trim()) {
      if (iti.isValidNumber()) {
        validMsg.classList.remove('hide');
      } else {
        input.classList.add('error');
        let errorCode = iti.getValidationError();
        errorMsg.textContent = errorMap[errorCode];
        errorMsg.classList.remove('hide');
      }
    }
  });
  input.addEventListener('keyup', function () {
    reset();
    if (input.value.trim()) {
      if (iti.isValidNumber()) {
        validMsg.classList.remove('hide');
      } else {
        input.classList.add('error');
        let errorCode = iti.getValidationError();
        errorMsg.textContent = errorMap[errorCode];
        errorMsg.classList.remove('hide');
      }
    }
  });

  input.addEventListener('change', reset);

  for (let i = 0; i < countryData.length; i++) {
    let country = countryData[i];
    let optionNode = document.createElement('option');
    optionNode.value = country.iso2;
    let textNode = document.createTextNode(countryList.of(country.iso2.toUpperCase()));
    optionNode.appendChild(textNode);
    addressDropdown.appendChild(optionNode);
  }

  let dropDownFlagList = document.querySelectorAll('.iti__country-name');
  dropDownFlagList.forEach((e) => {
    let countryValue = e.parentElement.getAttribute('data-country-code').toUpperCase(),
      editedCountryName = countryList.of(countryValue);
    e.textContent = editedCountryName;
  });

  addressDropdown.value = iti.getSelectedCountryData().iso2;

  input.addEventListener('countrychange', function (e) {
    addressDropdown.value = iti.getSelectedCountryData().iso2;
    if (addressDropdown.classList.contains('error')) {
      reset();
      input.value = '';
    }
  });

  addressDropdown.addEventListener('change', function () {
    iti.setCountry(this.value);
    reset();
    input.value = '';
  });

  if (scrollToForm) {
    document.querySelectorAll('.scroll-to-form').forEach((el) =>
      el.addEventListener('click', () => {
        document.querySelector('form-container').scrollIntoView({
          behavior: 'smooth',
        });
        document.querySelector('form-container .input__name').focus();
      }),
    );
  }

  input.addEventListener('keydown', phoneFieldOnlyDigits);

  input.addEventListener('keyup', () => {
    if (errorMsg.textContent.includes('undefined')) {
      errorMsg.textContent = '✘';
    }
  });

  document.querySelector('.contact__form-button').addEventListener('click', () => {
    alert('Form is temporarily disabled 😫');
    let tempCountry = addressDropdown.value;
    document.querySelector('.contact__form').reset();
    addressDropdown.value = tempCountry;
  });

  function phoneFieldOnlyDigits(e) {
    if (
      (e.key >= 0 && e.key <= 9) ||
      e.key === '+' ||
      e.key === '-' ||
      e.key === '/' ||
      e.key === '.' ||
      e.key === 'Backspace' ||
      e.key === 'Delete' ||
      e.key === 'ArrowLeft' ||
      e.key === 'ArrowRight' ||
      e.key === 'End' ||
      e.key === 'Home'
    ) {
      return true;
    } else {
      e.preventDefault();
    }
  }
});
