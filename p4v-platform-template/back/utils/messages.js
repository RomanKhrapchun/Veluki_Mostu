const authErrorMessage = "Не авторизований"
const logOutMessage = 'Ви успішно вийшли.'
const userAuthenticatedErrorMessage = "Невірний користувач або пароль."
const userAccountNotActivatedErrorMessage = "Обліковий запис не активовано."
const blockedIPNotification = "Ваша IP адреса була заблокована за порушення правил безпеки."
const blockedIPMessage = 'Ір адреса успішно заблокована.'
const unblockedIPNotification = "IP адреса успішно розблокована."
const databaseErrorMessage = 'Не вдалося виконати запит до бази даних. Будь ласка, спробуйте ще раз пізніше або зверніться до адміністратора системи.'
const permissionErrorMessage = 'На жаль, ця операція не дозволена вам виконувати.'
const serverErrorMessage = 'Помилки в процесі виконання запиту на сервері'
const fieldsListMissingError = 'Список полів для відображення даних в таблиці не передано.'
const NotFoundErrorMessage = 'Інформація за вказаними даними не знайдена.'
const existingUsernameEmailError = 'Це ім\'я користувача або електронна скринька вже комусь належить. Спробуйте інше.'
const deleteError = 'Помилка видалення запису.'
const deleteFileError = 'Помилка видалення файлу.'
const updateDataMissingError = 'Тіло запиту не містить даних для оновлення запису. Будь ласка, надайте дані для оновлення.'
const updateDataError = 'Не вдалося оновити дані. Будь ласка, перевірте введені дані та спробуйте ще раз.'
const stackError = 'Стек помилки показує, що '
const stackError1 = ', що призвело до неправильної обробки запиту.'
const deleteSuccessFile = 'Файл успішно видалено.'
const deleteSuccessMessage = 'Запис успішно видалено.'
const updateSuccessMessage = 'Інформацію успішно оновлено.'
const createSuccessMessage = 'Новий запис успішно створено.'
const fileErrorSave = 'Помилка збереження файла.'
const maxFilesError = 'Ви можете передати максимум 5 файлів одночасно.'
const maxFileBytes = 'Один або більше файлів перевищують максимальний розмір у 20MB.'
const rateLimitError = 'Вибачте, ви перевищили ліміт запитів. Зачекайте 1 хвилину перед наступною спробою.'
const groupDeleteError = 'Неможливо видалити групу доступу. Спочатку видаліть усіх користувачів, пов\'язаних із цією групою'
const guideDeleteError = 'Неможливо видалити довідник: спершу видаліть всі дані, що в ньому містяться.'
const moduleDeleteError = 'Неможливо видалити модуль. Спочатку видаліть усі реєстри, які пов\'язані із цим модулем.'

module.exports = {
    permissionErrorMessage,
    databaseErrorMessage,
    serverErrorMessage,
    authErrorMessage,
    userAuthenticatedErrorMessage,
    userAccountNotActivatedErrorMessage,
    fieldsListMissingError,
    NotFoundErrorMessage,
    existingUsernameEmailError,
    deleteError,
    deleteFileError,
    updateDataMissingError,
    updateDataError,
    guideDeleteError,
    stackError,
    stackError1,
    fileErrorSave,
    maxFilesError,
    maxFileBytes,
    rateLimitError,
    deleteSuccessMessage,
    deleteSuccessFile,
    updateSuccessMessage,
    createSuccessMessage,
    logOutMessage,
    blockedIPNotification,
    blockedIPMessage,
    unblockedIPNotification,
    groupDeleteError,
    moduleDeleteError,
}