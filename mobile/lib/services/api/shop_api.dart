import '../api_client.dart';

class ProductItem {
  final String id;
  final String name;
  final String? description;
  final String emoji;
  final String category;
  final double price;
  final String? imageUrl;
  final int stock;
  final bool isOnSale;

  ProductItem({
    required this.id,
    required this.name,
    this.description,
    this.emoji = '📦',
    required this.category,
    required this.price,
    this.imageUrl,
    this.stock = 0,
    this.isOnSale = true,
  });

  factory ProductItem.fromJson(Map<String, dynamic> json) {
    return ProductItem(
      id: json['id'] as String,
      name: json['name'] as String,
      description: json['description'] as String?,
      emoji: (json['emoji'] as String?) ?? '📦',
      category: json['category'] as String,
      price: (json['price'] as num).toDouble(),
      imageUrl: json['imageUrl'] as String?,
      stock: (json['stock'] as num?)?.toInt() ?? 0,
      isOnSale: (json['isOnSale'] as bool?) ?? true,
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'name': name,
        'description': description,
        'emoji': emoji,
        'category': category,
        'price': price,
        'imageUrl': imageUrl,
        'stock': stock,
        'isOnSale': isOnSale,
      };
}

class CartItemData {
  final String id;
  final String productId;
  final ProductItem product;
  final int quantity;

  CartItemData({
    required this.id,
    required this.productId,
    required this.product,
    required this.quantity,
  });

  factory CartItemData.fromJson(Map<String, dynamic> json) {
    return CartItemData(
      id: json['id'] as String,
      productId: json['productId'] as String,
      product: ProductItem.fromJson(json['product'] as Map<String, dynamic>),
      quantity: (json['quantity'] as num?)?.toInt() ?? 1,
    );
  }
}

class ShopApi {
  final ApiClient _client;
  ShopApi(this._client);

  /// 商品列表
  Future<List<ProductItem>> getProducts({String? category, String? keyword, int page = 1, int size = 20}) async {
    final query = <String, String>{'page': '$page', 'size': '$size'};
    if (category != null && category != '全部') query['category'] = category;
    if (keyword != null && keyword.isNotEmpty) query['keyword'] = keyword;
    final res = await _client.get('/shop/products', query: query);
    final list = res['data'] as List<dynamic>? ?? [];
    return list.map((e) => ProductItem.fromJson(e as Map<String, dynamic>)).toList();
  }

  /// 购物车
  Future<List<CartItemData>> getCart() async {
    final res = await _client.get('/shop/cart');
    final list = res['data'] as List<dynamic>? ?? [];
    return list.map((e) => CartItemData.fromJson(e as Map<String, dynamic>)).toList();
  }

  Future<CartItemData> addToCart(String productId, {int quantity = 1}) async {
    final res = await _client.post('/shop/cart', body: {'productId': productId, 'quantity': quantity});
    return CartItemData.fromJson(res['data'] as Map<String, dynamic>);
  }

  Future<void> updateCartItem(String id, int quantity) async {
    await _client.put('/shop/cart/$id', body: {'quantity': quantity});
  }

  Future<void> removeFromCart(String id) async {
    await _client.delete('/shop/cart/$id');
  }
}
