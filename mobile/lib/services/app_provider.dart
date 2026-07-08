import 'package:flutter/material.dart';
import '../models/pet.dart';
import '../models/reminder.dart';
import '../models/expense.dart';
import '../models/recipe.dart';
import '../models/note.dart';
import '../models/weight_record.dart';
import '../models/medical_record.dart';
import '../models/stock_item.dart';

class AppProvider extends ChangeNotifier {
  bool _isLoggedIn = false;
  List<Pet> _pets = [];
  Pet? _currentPet;
  Pet? _pendingPet;
  List<Reminder> _reminders = [];
  List<Expense> _expenses = [];
  List<RecipeEntry> _recipes = [];
  List<NoteEntry> _notes = [];
  List<WeightRecord> _weightRecords = [];
  List<MedicalRecord> _medicalRecords = [];
  List<StockItem> _stockItems = [];

  // ── Getters ──

  bool get isLoggedIn => _isLoggedIn;
  List<Pet> get pets => _pets;
  Pet? get currentPet => _currentPet;
  Pet? get pendingPet => _pendingPet;
  List<Reminder> get reminders => _reminders;
  List<Expense> get expenses => _expenses;
  List<RecipeEntry> get recipes => _recipes;
  List<NoteEntry> get notes => _notes;
  List<WeightRecord> get weightRecords => _weightRecords;
  List<MedicalRecord> get medicalRecords => _medicalRecords;
  List<StockItem> get stockItems => _stockItems;

  // ── Filtered by current pet ──

  List<Reminder> get currentPetReminders {
    if (_currentPet == null) return [];
    return _reminders.where((r) => r.petId == _currentPet!.id).toList();
  }

  List<Expense> get currentPetExpenses {
    if (_currentPet == null) return [];
    return _expenses.where((e) => e.petId == _currentPet!.id).toList();
  }

  double get currentPetTotalExpense {
    return currentPetExpenses.fold(0, (sum, e) => sum + e.amount);
  }

  List<RecipeEntry> get currentPetRecipes {
    if (_currentPet == null) return [];
    return _recipes.where((r) => r.petId == _currentPet!.id).toList();
  }

  List<NoteEntry> get currentPetNotes {
    if (_currentPet == null) return [];
    return _notes.where((n) => n.petId == _currentPet!.id).toList();
  }

  List<WeightRecord> get currentPetWeightRecords {
    if (_currentPet == null) return [];
    final records = _weightRecords.where((w) => w.petId == _currentPet!.id).toList();
    records.sort((a, b) => a.date.compareTo(b.date));
    return records;
  }

  List<MedicalRecord> get currentPetMedicalRecords {
    if (_currentPet == null) return [];
    final records = _medicalRecords.where((m) => m.petId == _currentPet!.id).toList();
    records.sort((a, b) => b.date.compareTo(a.date));
    return records;
  }

  List<StockItem> get currentPetStockItems {
    if (_currentPet == null) return [];
    return _stockItems.where((s) => s.petId == _currentPet!.id).toList();
  }

  // ── Pet registration flow ──

  void startNewPet({
    required String name,
    required String type,
    required String gender,
    required DateTime meetDate,
    String breed = '',
    String? birthday,
    String emoji = '🐶',
  }) {
    _pendingPet = Pet(
      id: 'pet_${DateTime.now().millisecondsSinceEpoch}',
      name: name,
      gender: gender,
      type: type,
      meetDate: meetDate,
      breed: breed,
      birthday: birthday,
      emoji: emoji,
      weight: 0.0,
      isNeutered: false,
    );
    notifyListeners();
  }

  void updatePendingPet({
    String? gender,
    double? weight,
    bool? isNeutered,
    String? emoji,
  }) {
    if (_pendingPet != null) {
      _pendingPet = _pendingPet!.copyWith(
        gender: gender,
        weight: weight,
        isNeutered: isNeutered,
        emoji: emoji,
      );
      notifyListeners();
    }
  }

  void completeRegistration() {
    if (_pendingPet != null) {
      _pets.add(_pendingPet!);
      _currentPet = _pendingPet;
      _isLoggedIn = true;
      _pendingPet = null;
      notifyListeners();
    }
  }

  void loginWithFirstPet(Pet pet) {
    final existingIndex = _pets.indexWhere((p) => p.id == pet.id);
    if (existingIndex == -1) {
      _pets.add(pet);
    } else {
      _pets[existingIndex] = pet;
    }
    _currentPet = pet;
    _isLoggedIn = true;
    notifyListeners();
  }

  void switchPet(Pet pet) {
    if (_pets.contains(pet)) {
      _currentPet = pet;
      notifyListeners();
    }
  }

  void addPet(Pet pet) {
    _pets.add(pet);
    _currentPet = pet;
    notifyListeners();
  }

  void updatePet(Pet updatedPet) {
    final index = _pets.indexWhere((p) => p.id == updatedPet.id);
    if (index != -1) {
      _pets[index] = updatedPet;
      if (_currentPet?.id == updatedPet.id) {
        _currentPet = updatedPet;
      }
      notifyListeners();
    }
  }

  // ── Reminder CRUD ──

  void addReminder(Reminder reminder) {
    _reminders.add(reminder);
    notifyListeners();
  }

  void updateReminder(Reminder reminder) {
    final index = _reminders.indexWhere((r) => r.id == reminder.id);
    if (index != -1) {
      _reminders[index] = reminder;
      notifyListeners();
    }
  }

  void toggleReminderComplete(String reminderId) {
    final index = _reminders.indexWhere((r) => r.id == reminderId);
    if (index != -1) {
      _reminders[index] = _reminders[index].copyWith(
        isCompleted: !_reminders[index].isCompleted,
      );
      notifyListeners();
    }
  }

  void deleteReminder(String reminderId) {
    _reminders.removeWhere((r) => r.id == reminderId);
    notifyListeners();
  }

  List<Reminder> getPetReminders(String petId) {
    return _reminders.where((r) => r.petId == petId).toList();
  }

  // ── Expense CRUD ──

  void addExpense(Expense expense) {
    _expenses.add(expense);
    notifyListeners();
  }

  void deleteExpense(String expenseId) {
    _expenses.removeWhere((e) => e.id == expenseId);
    notifyListeners();
  }

  // ── Recipe CRUD ──

  void addRecipe(RecipeEntry recipe) {
    _recipes.add(recipe);
    notifyListeners();
  }

  void deleteRecipe(String recipeId) {
    _recipes.removeWhere((r) => r.id == recipeId);
    notifyListeners();
  }

  // ── Note CRUD ──

  void addNote(NoteEntry note) {
    _notes.add(note);
    notifyListeners();
  }

  void updateNote(NoteEntry note) {
    final index = _notes.indexWhere((n) => n.id == note.id);
    if (index != -1) {
      _notes[index] = note;
      notifyListeners();
    }
  }

  void deleteNote(String noteId) {
    _notes.removeWhere((n) => n.id == noteId);
    notifyListeners();
  }

  // ── Weight CRUD ──

  void addWeightRecord(WeightRecord record) {
    _weightRecords.add(record);
    // Also update pet's current weight
    if (_currentPet != null && _currentPet!.id == record.petId) {
      _currentPet = _currentPet!.copyWith(weight: record.weight);
      _pets[_pets.indexWhere((p) => p.id == _currentPet!.id)] = _currentPet!;
    }
    notifyListeners();
  }

  void deleteWeightRecord(String recordId) {
    _weightRecords.removeWhere((w) => w.id == recordId);
    notifyListeners();
  }

  // ── Medical CRUD ──

  void addMedicalRecord(MedicalRecord record) {
    _medicalRecords.add(record);
    notifyListeners();
  }

  void deleteMedicalRecord(String recordId) {
    _medicalRecords.removeWhere((m) => m.id == recordId);
    notifyListeners();
  }

  // ── Stock CRUD ──

  void addStockItem(StockItem item) {
    _stockItems.add(item);
    notifyListeners();
  }

  void updateStockItem(StockItem item) {
    final index = _stockItems.indexWhere((s) => s.id == item.id);
    if (index != -1) {
      _stockItems[index] = item;
      notifyListeners();
    }
  }

  void decrementStock(String itemId, {int amount = 1}) {
    final index = _stockItems.indexWhere((s) => s.id == itemId);
    if (index != -1) {
      final item = _stockItems[index];
      final newRemaining = (item.remaining - amount).clamp(0, item.total);
      _stockItems[index] = item.copyWith(remaining: newRemaining);
      notifyListeners();
    }
  }

  void deleteStockItem(String itemId) {
    _stockItems.removeWhere((s) => s.id == itemId);
    notifyListeners();
  }

  // ── Demo data seeding (for testing) ──

  void seedDemoData() {
    if (_currentPet == null) return;
    final petId = _currentPet!.id;
    final now = DateTime.now();

    // Seed reminders
    if (_reminders.isEmpty) {
      _reminders.addAll([
        Reminder(
          id: 'seed_r1',
          petId: petId,
          title: '年度疫苗',
          type: ReminderType.vaccine,
          description: '狂犬疫苗加强针',
          date: now.add(const Duration(days: 3)),
          time: const TimeOfDay(hour: 9, minute: 0),
        ),
        Reminder(
          id: 'seed_r2',
          petId: petId,
          title: '每月驱虫',
          type: ReminderType.deworm,
          date: now.add(const Duration(days: 7)),
          time: const TimeOfDay(hour: 8, minute: 30),
        ),
      ]);
    }

    // Seed expenses
    if (_expenses.isEmpty) {
      _expenses.addAll([
        Expense(id: 'seed_e1', petId: petId, category: ExpenseCategory.food, amount: 258.00, note: '进口天然粮', date: now.subtract(const Duration(days: 5))),
        Expense(id: 'seed_e2', petId: petId, category: ExpenseCategory.medical, amount: 680.00, note: '年度体检', date: now.subtract(const Duration(days: 14))),
        Expense(id: 'seed_e3', petId: petId, category: ExpenseCategory.bath, amount: 150.00, note: '美容洗护', date: now.subtract(const Duration(days: 20))),
      ]);
    }

    // Seed recipes
    if (_recipes.isEmpty) {
      _recipes.addAll([
        RecipeEntry(id: 'seed_rec1', petId: petId, food: '鸡胸肉 + 南瓜', time: now.subtract(const Duration(days: 1)), amount: '200g', frequency: '每日一次'),
        RecipeEntry(id: 'seed_rec2', petId: petId, food: '三文鱼拌饭', time: now.subtract(const Duration(days: 2)), amount: '150g', frequency: '每周三次'),
      ]);
    }

    // Seed notes
    if (_notes.isEmpty) {
      _notes.addAll([
        NoteEntry(id: 'seed_n1', petId: petId, title: '新狗粮尝试记录', content: '换了一款无谷狗粮，过渡了一周目前反应良好，准备继续吃这款。', updatedAt: now.subtract(const Duration(days: 3))),
        NoteEntry(id: 'seed_n2', petId: petId, title: '宠物医院联系方式', content: '友爱宠物医院：010-8888-6666\n地址：朝阳区旺财路88号', updatedAt: now.subtract(const Duration(days: 10))),
      ]);
    }

    // Seed weight records
    if (_weightRecords.isEmpty) {
      _weightRecords.addAll([
        WeightRecord(id: 'seed_w1', petId: petId, weight: 12.5, date: now.subtract(const Duration(days: 90))),
        WeightRecord(id: 'seed_w2', petId: petId, weight: 13.2, date: now.subtract(const Duration(days: 60))),
        WeightRecord(id: 'seed_w3', petId: petId, weight: 14.0, date: now.subtract(const Duration(days: 30))),
        WeightRecord(id: 'seed_w4', petId: petId, weight: 14.5, date: now),
      ]);
    }

    // Seed medical records
    if (_medicalRecords.isEmpty) {
      _medicalRecords.addAll([
        MedicalRecord(
          id: 'seed_m1', petId: petId, title: '年度体检',
          date: now.subtract(const Duration(days: 60)),
          hospital: '友爱宠物医院', symptoms: '无', diagnosis: '健康状况良好',
          treatment: '无需治疗', cost: '¥680',
        ),
        MedicalRecord(
          id: 'seed_m2', petId: petId, title: '皮肤过敏',
          date: now.subtract(const Duration(days: 150)),
          hospital: '友爱宠物医院', symptoms: '皮肤红肿、频繁抓挠',
          diagnosis: '食物过敏引起皮炎', treatment: '抗过敏药 + 更换狗粮',
          cost: '¥420',
        ),
      ]);
    }

    // Seed stock items
    if (_stockItems.isEmpty) {
      _stockItems.addAll([
        StockItem(id: 'seed_s1', petId: petId, name: '进口天然粮', brand: '皇家', category: StockCategory.food, remaining: 2, total: 5, unit: '袋'),
        StockItem(id: 'seed_s2', petId: petId, name: '鸡肉零食', brand: '珍宝', category: StockCategory.food, remaining: 8, total: 10, unit: '包'),
        StockItem(id: 'seed_s3', petId: petId, name: '沐浴露', brand: '雪貂', category: StockCategory.supplies, remaining: 1, total: 1, unit: '瓶'),
        StockItem(id: 'seed_s4', petId: petId, name: '驱虫药', brand: '拜耳', category: StockCategory.medicine, remaining: 3, total: 6, unit: '粒'),
        StockItem(id: 'seed_s5', petId: petId, name: '橡胶球', brand: 'KONG', category: StockCategory.toy, remaining: 2, total: 3, unit: '个'),
      ]);
    }

    notifyListeners();
  }

  // ── Logout ──

  void logout() {
    _isLoggedIn = false;
    _pets.clear();
    _currentPet = null;
    _pendingPet = null;
    _reminders.clear();
    _expenses.clear();
    _recipes.clear();
    _notes.clear();
    _weightRecords.clear();
    _medicalRecords.clear();
    _stockItems.clear();
    notifyListeners();
  }
}

