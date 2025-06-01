import { enableValidation } from '../components/validate.js';
import { openModal, closeModal, setupPopupCloseListeners } from '../components/modal.js';
import { createCard, deleteCard, likeCard } from './cards.js';
import { 
  getProfileInfo, 
  getInitialCards, 
  updateProfile, 
  addNewCard, 
  deleteCardApi,
  likeCard as likeCardApi,
  unlikeCard as unlikeCardApi,
  updateAvatar
} from '../components/api.js';
import '../pages/index.css';

const validationSettings = {
  formSelector: '.popup__form',
  inputSelector: '.popup__input',
  submitButtonSelector: '.popup__button',
  inactiveButtonClass: 'popup__button_disabled',
  inputErrorClass: 'popup__input_type_error',
  errorClass: 'popup__error_visible'
};

let userId; // Добавляем объявление userId

const profilePopup = document.querySelector('.popup_type_edit');
const cardPopup = document.querySelector('.popup_type_new-card');
const imagePopup = document.querySelector('.popup_type_image');
const avatarPopup = document.querySelector('.popup_type_avatar');
const profileForm = document.querySelector('.popup__form[name="edit-profile"]');
const cardForm = document.querySelector('.popup__form[name="new-place"]');
const avatarForm = document.querySelector('.popup__form[name="edit-avatar"]');
const nameInput = profileForm.querySelector('.popup__input_type_name');
const jobInput = profileForm.querySelector('.popup__input_type_description');
const profileEditButton = document.querySelector('.profile__edit-button');
const profileAddButton = document.querySelector('.profile__add-button');
const avatarEditButton = document.querySelector('.profile__image-overlay');
const placesList = document.querySelector('.places__list');
const editAvatarButton = document.getElementById('edit-avatar-button');
const closeAvatarPopup = avatarPopup.querySelector('.popup__close');

// Функции для работы с попапом
function openAvatarPopup() {
  avatarPopup.classList.add('popup_opened');
}


// Вешаем обработчики
editAvatarButton.addEventListener('click', openAvatarPopup);
closeAvatarPopup.addEventListener('click', closeAvatarPopup);

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
  const submitButton = evt.target.querySelector('.popup__button');
  const originalText = submitButton.textContent;
  
  submitButton.textContent = 'Сохранение...';
  
  updateProfile(nameInput.value, jobInput.value)
    .then(userData => {
      document.querySelector('.profile__title').textContent = userData.name;
      document.querySelector('.profile__description').textContent = userData.about;
      closeModal(profilePopup);
    })
    .catch(err => console.log(err))
    .finally(() => {
      submitButton.textContent = originalText;
    });
}



function handleCardFormSubmit(evt) {
  evt.preventDefault();
  const submitButton = evt.target.querySelector('.popup__button');
  const originalText = submitButton.textContent;
  
  submitButton.textContent = 'Создание...';
  
  addNewCard(
    cardForm.querySelector('.popup__input_type_card-name').value,
    cardForm.querySelector('.popup__input_type_url').value
  )
    .then(cardData => {
      placesList.prepend(renderCard(cardData, userId));
      cardForm.reset();
      closeModal(cardPopup);
    })
    .catch(err => console.log(err))
    .finally(() => {
      submitButton.textContent = originalText;
    });
}
// Инициализация
setupPopupCloseListeners();
enableValidation(validationSettings);



// Обработчики событий
profileEditButton.addEventListener('click', () => {
  nameInput.value = document.querySelector('.profile__title').textContent;
  jobInput.value = document.querySelector('.profile__description').textContent;
  openModal(profilePopup);
});
document.querySelector('.profile__image-overlay').addEventListener('click', () => {
  openModal(avatarPopup);
});
profileAddButton.addEventListener('click', () => {
  openModal(cardPopup);
});

function renderCard(cardData, userId) {
  const card = createCard(
    cardData,
    () => handleDeleteCard(cardData._id),
    () => handleLikeCard(cardData._id, cardData.likes.some(like => like._id === userId)),
    openImagePopup
  );
  
  card.dataset.cardId = cardData._id;
  
  const deleteButton = card.querySelector('.card__delete-button');
  if (cardData.owner._id !== userId) {
    deleteButton.style.display = 'none';
  }
  
  const likeButton = card.querySelector('.card__like-button');
  if (cardData.likes.some(like => like._id === userId)) {
    likeButton.classList.add('card__like-button_is-active');
  }
  
  const likeCount = card.querySelector('.card__like-count');
  likeCount.textContent = cardData.likes.length;
  
  return card;
}

Promise.all([getProfileInfo(), getInitialCards()])
  .then(([userData, cards]) => {
    userId = userData._id; // Сохраняем userId
    
    document.querySelector('.profile__title').textContent = userData.name;
    document.querySelector('.profile__description').textContent = userData.about;
    document.querySelector('.profile__image').style.backgroundImage = `url(${userData.avatar})`;
    
    cards.forEach(cardData => {
      placesList.append(renderCard(cardData, userId)); // Упрощаем вызов
    });
  })
  .catch(err => console.log(err));

profileForm.addEventListener('submit', handleProfileFormSubmit);
cardForm.addEventListener('submit', handleCardFormSubmit);

function handleDeleteCard(cardId) {
  deleteCardApi(cardId)
    .then(() => {
      document.querySelector(`[data-card-id="${cardId}"]`).remove();
    })
    .catch(err => console.log(err));
}

function handleLikeCard(cardId, isLiked) {
  const likeMethod = isLiked ? unlikeCardApi : likeCardApi;
  likeMethod(cardId)
    .then(updatedCard => {
      const cardElement = document.querySelector(`[data-card-id="${cardId}"]`);
      cardElement.querySelector('.card__like-button').classList.toggle('card__like-button_is-active');
      cardElement.querySelector('.card__like-count').textContent = updatedCard.likes.length;
    })
    .catch(err => console.log(err));
}

avatarEditButton.addEventListener('click', () => {
  openModal(avatarPopup);
});

function handleAvatarFormSubmit(evt) {
  evt.preventDefault();
  const submitButton = evt.target.querySelector('.popup__button');
  const originalText = submitButton.textContent;
  
  submitButton.textContent = 'Сохранение...';
  
  updateAvatar(avatarForm.querySelector('.popup__input_type_url').value)
    .then(userData => {
      document.querySelector('.profile__image').style.backgroundImage = `url(${userData.avatar})`;
      closeModal(avatarPopup);
      avatarForm.reset();
    })
    .catch(err => console.log(err))
    .finally(() => {
      submitButton.textContent = originalText;
    });
}

avatarForm.addEventListener('submit', handleAvatarFormSubmit);