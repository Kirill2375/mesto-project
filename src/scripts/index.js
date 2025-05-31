import { enableValidation } from '../components/validate.js';
import { openModal, closeModal, setupPopupCloseListeners } from '../components/modal.js';
import { initialCards, createCard, deleteCard, likeCard } from './cards.js';
import '../pages/index.css';

const validationSettings = {
  formSelector: '.popup__form',
  inputSelector: '.popup__input',
  submitButtonSelector: '.popup__button',
  inactiveButtonClass: 'popup__button_disabled',
  inputErrorClass: 'popup__input_type_error',
  errorClass: 'popup__error_visible'
};

const profilePopup = document.querySelector('.popup_type_edit');
const cardPopup = document.querySelector('.popup_type_new-card');
const imagePopup = document.querySelector('.popup_type_image');
const profileForm = document.querySelector('.popup__form[name="edit-profile"]');
const cardForm = document.querySelector('.popup__form[name="new-place"]');
const nameInput = profileForm.querySelector('.popup__input_type_name');
const jobInput = profileForm.querySelector('.popup__input_type_description');
const profileEditButton = document.querySelector('.profile__edit-button');
const profileAddButton = document.querySelector('.profile__add-button');
const placesList = document.querySelector('.places__list');

function openImagePopup(cardData) {
  const imageElement = imagePopup.querySelector('.popup__image');
  const captionElement = imagePopup.querySelector('.popup__caption');
  
  imageElement.src = cardData.link;
  imageElement.alt = cardData.name;
  captionElement.textContent = cardData.name;
  
  openModal(imagePopup);
}

function handleProfileFormSubmit(evt) {
  evt.preventDefault();
  document.querySelector('.profile__title').textContent = nameInput.value;
  document.querySelector('.profile__description').textContent = jobInput.value;
  closeModal(profilePopup);
}

function handleCardFormSubmit(evt) {
  evt.preventDefault();
  const newCard = {
    name: cardForm.querySelector('.popup__input_type_card-name').value,
    link: cardForm.querySelector('.popup__input_type_url').value
  };
  
  placesList.prepend(createCard(newCard, deleteCard, likeCard, openImagePopup));
  cardForm.reset();
  closeModal(cardPopup);
}

// Инициализация
setupPopupCloseListeners();
enableValidation(validationSettings);

// Загрузка начальных карточек
initialCards.forEach(cardData => {
  placesList.append(createCard(cardData, deleteCard, likeCard, openImagePopup));
});

// Обработчики событий
profileEditButton.addEventListener('click', () => {
  nameInput.value = document.querySelector('.profile__title').textContent;
  jobInput.value = document.querySelector('.profile__description').textContent;
  openModal(profilePopup);
});

profileAddButton.addEventListener('click', () => {
  openModal(cardPopup);
});

profileForm.addEventListener('submit', handleProfileFormSubmit);
cardForm.addEventListener('submit', handleCardFormSubmit);