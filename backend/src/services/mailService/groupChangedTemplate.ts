/**
 * Шаблон сообщения о изменении в группу VPN
 */
export const groupChangedTemplate = `
<!doctype html>
<html lang="ru">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Изменения в группе VPN</title>
  </head>
  <body></body>
</html>
<body>
  <style>
    table,
    th,
    td {
      border: 1px solid;
      border-collapse: collapse;
      padding: 5px;
    }
    .added {
      background-color: #d1e7dd;
    }
    .removed {
      background-color: #f8d7da;
    }
  </style>

  <h1>Произошли изменения в группе VPN</h1>
  <table>
    <tr>
      <th>Добавлен/удален</th>
      <th>Логин</th>
      <th>ФИО</th>
      <th>Предприятие</th>
      <th>Отдел</th>
      <th>Основание</th>
    </tr>
    {{placeholder}}
  </table>
</body>
`;
